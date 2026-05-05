import requests

url = "https://leetcode.com/graphql"
query = """
query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
        title
    }
}
"""
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Content-Type": "application/json"
}
response = requests.post(url, json={"query": query, "variables": {"titleSlug": "two-sum"}}, headers=headers)
print(response.status_code)
print(response.text)
