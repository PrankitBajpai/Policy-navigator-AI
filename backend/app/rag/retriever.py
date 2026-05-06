from langchain_community.vectorstores import FAISS
from app.rag.embedder import get_embedding_model

DB_PATH = "faiss_index"

def get_retriever():
    embeddings = get_embedding_model()

    vectorstore = FAISS.load_local(
        DB_PATH,
        embeddings,
        allow_dangerous_deserialization=True
    )

    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 4}
    )

    return retriever