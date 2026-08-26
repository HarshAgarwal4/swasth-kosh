from fastapi import HTTPException, status

class AIServiceException(HTTPException):
    def __init__(self, detail: str = "AI Service Error", status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(status_code=status_code, detail=detail)

class InvalidAudioFormatException(AIServiceException):
    def __init__(self, detail: str = "Invalid or unreadable audio format"):
        super().__init__(detail=detail, status_code=status.HTTP_400_BAD_REQUEST)

class UnauthorizedAccessException(AIServiceException):
    def __init__(self, detail: str = "Invalid AI Service Key"):
        super().__init__(detail=detail, status_code=status.HTTP_401_UNAUTHORIZED)
