from app.rag.retriever import get_retriever

retriever = get_retriever()

def ask_rag(query: str):

    docs = retriever.invoke(query)

    if not docs:
        return {
            "answer": "No relevant scheme found.",
            "sources": []
        }

    context = "\n\n".join([doc.page_content for doc in docs])

    answer = f"""
Based on the available government schemes data:

{context}
"""

    return {
        "answer": answer,
        "sources": [doc.metadata for doc in docs]
    }