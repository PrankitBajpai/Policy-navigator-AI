import pandas as pd
from langchain_core.documents import Document

CSV_PATH = "data/schemes_cleaned.csv"

def load_csv_data():

    print("Loading CSV data...")

    df = pd.read_csv(CSV_PATH)

    documents = []

    for _, row in df.iterrows():

        content = f"""
        Scheme Name: {row.get('scheme_name', '')}

        Details:
        {row.get('details', '')}

        Benefits:
        {row.get('benefits', '')}

        Eligibility:
        {row.get('eligibility', '')}

        Application Process:
        {row.get('application', '')}

        Required Documents:
        {row.get('documents', '')}

        Level:
        {row.get('level', '')}

        Category:
        {row.get('schemecategory', '')}

        Tags:
        {row.get('tags', '')}
        """

        documents.append(
            Document(
                page_content=content,
                metadata={
                    "scheme_name": str(row.get("scheme_name", "")),
                    "slug": str(row.get("slug", "")),
                    "category": str(row.get("schemecategory", "")),
                    "level": str(row.get("level", "")),
                }
            )
        )

    print(f"Loaded {len(documents)} documents")

    return documents