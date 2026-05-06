from app.rag.loader import load_csv_data
from app.rag.chunker import chunk_documents
from app.rag.embedder import get_embedding_model
from app.rag.vectorstore import create_vectorstore

print("Loading CSV data...")
documents = load_csv_data()

print("Chunking documents...")
chunks = chunk_documents(documents)

print("Loading embedding model...")
embeddings = get_embedding_model()

print("Creating FAISS vector DB...")
create_vectorstore(chunks, embeddings)

print("RAG ingestion complete!")