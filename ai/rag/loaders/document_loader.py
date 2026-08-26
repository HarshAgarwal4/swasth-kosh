import os
import glob

def load_documents(directory_path: str = "data/documents"):
    """
    Loads text and guideline files from documents directory.
    """
    docs = []
    if not os.path.exists(directory_path):
        os.makedirs(directory_path, exist_ok=True)

    files = glob.glob(os.path.join(directory_path, "*.txt")) + glob.glob(os.path.join(directory_path, "*.md"))
    for file_path in files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                docs.append({
                    "id": os.path.basename(file_path),
                    "title": os.path.splitext(os.path.basename(file_path))[0].replace("_", " ").title(),
                    "content": content,
                    "source": os.path.basename(file_path),
                })
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
    return docs

def extract_document_text(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()
