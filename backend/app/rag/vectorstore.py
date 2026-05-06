from langchain_community.vectorstores import FAISS

def create_vectorstore(chunks, embeddings):
    vectorstore = FAISS.from_documents(chunks, embeddings)

    vectorstore.save_local("faiss_index")

    return vectorstore