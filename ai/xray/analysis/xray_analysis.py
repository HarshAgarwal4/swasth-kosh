from xray.inference.xray_classifier import run_xray_inference

def analyze_xray_result(image_path_or_url: str):
    return run_xray_inference(image_path_or_url)
