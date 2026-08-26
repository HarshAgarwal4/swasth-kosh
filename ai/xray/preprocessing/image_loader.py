def load_xray(image_path_or_url: str):
    """
    Placeholder loader for digital chest radiographs (DICOM / PNG / JPEG).
    """
    return {
        "status": "LOADED",
        "path": image_path_or_url,
        "format": "DICOM/JPEG",
    }
