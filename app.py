import requests
import xml.etree.ElementTree as ET
from flask import Flask, jsonify, render_template
from datetime import datetime
import html
import re

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

NAMESPACES = {
    'atom': 'http://www.w3.org/2005/Atom',
    'blog': 'tag:blogger.com,1999:blog-',
}

def clean_html(raw_html: str) -> str:
    """Strip HTML tags and decode HTML entities."""
    text = re.sub(r'<[^>]+>', ' ', raw_html)
    text = html.unescape(text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def parse_feed(xml_text: str) -> list[dict]:
    root = ET.fromstring(xml_text)
    ns = {'a': 'http://www.w3.org/2005/Atom'}
    entries = []

    for entry in root.findall('a:entry', ns):
        title_el = entry.find('a:title', ns)
        summary_el = entry.find('a:summary', ns)
        content_el = entry.find('a:content', ns)
        published_el = entry.find('a:published', ns)
        updated_el = entry.find('a:updated', ns)
        link_el = entry.find('a:link[@rel="alternate"]', ns)
        id_el = entry.find('a:id', ns)

        # Prefer content over summary
        raw_body = (content_el.text if content_el is not None and content_el.text else
                    (summary_el.text if summary_el is not None else ''))

        plain_body = clean_html(raw_body) if raw_body else ''
        title_text = title_el.text if title_el is not None else 'Untitled'
        link_href = link_el.get('href', '#') if link_el is not None else '#'

        date_str = (published_el.text if published_el is not None else
                    (updated_el.text if updated_el is not None else ''))
        try:
            dt = datetime.fromisoformat(date_str.replace('Z', '+00:00')) if date_str else None
            formatted_date = dt.strftime('%B %d, %Y') if dt else 'Unknown date'
        except Exception:
            formatted_date = date_str or 'Unknown date'

        entries.append({
            'id': id_el.text if id_el is not None else '',
            'title': title_text,
            'body_html': raw_body,
            'body_plain': plain_body,
            'date': formatted_date,
            'link': link_href,
        })

    return entries


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/release-notes')
def release_notes():
    try:
        resp = requests.get(FEED_URL, timeout=15)
        resp.raise_for_status()
        entries = parse_feed(resp.text)
        return jsonify({'status': 'ok', 'entries': entries, 'count': len(entries)})
    except requests.RequestException as e:
        return jsonify({'status': 'error', 'message': str(e)}), 502
    except ET.ParseError as e:
        return jsonify({'status': 'error', 'message': f'XML parse error: {e}'}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
