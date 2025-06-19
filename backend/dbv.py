# © 2025 April Intelligence. All rights reserved.
# This code is proprietary and confidential.
# Unauthorized use, distribution, or copying is prohibited.
# For inquiries, contact vince@aprilintelligence.com

import os
from pinecone import Pinecone

pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
_index_cache = {}


def get_index(index_name):
    """Retrieve the Pinecone index resource, w/ caching."""
    if index_name in _index_cache:
        return _index_cache[index_name]
    index = pc.Index(index_name)
    _index_cache[index_name] = index
    return index


def index_upsert(index_name, namespace, records):
    """Upsert an item into a Pinecone index."""
    index = get_index(index_name)
    index.upsert_records(namespace, records)


def index_query(
    index_name, namespace, query, top_k=10, top_n=5, fields=["text", "timestamp"]
):
    """Query an item from a Pinecone index."""
    index = get_index(index_name)
    hits = index.search_records(
        namespace=namespace,
        query={
            "inputs": {"text": query},
            "top_k": top_k,
        },
        # rerank={
        #     "model": "bge-reranker-v2-m3",
        #     "top_n": top_n,
        #     "rank_fields": ["text"]
        # },
        fields=fields,
    )["result"].get("hits", [])
    print(f"Hits: {hits}")
    return hits
