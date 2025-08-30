from typing import Any, Dict
from pydantic_core import from_json
import time


class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'


def log_info(message: str, details: str = None):
    """Log informational messages in blue color."""
    print(f"{Colors.BLUE}INFO: {message}{Colors.END}")
    if details:
        print(f"{Colors.BLUE}   └─ {details}{Colors.END}")


def log_success(message: str, details: str = None):
    """Log success messages in green color."""
    print(f"{Colors.GREEN}SUCCESS: {message}{Colors.END}")
    if details:
        print(f"{Colors.GREEN}   └─ {details}{Colors.END}")


def log_warning(message: str, details: str = None):
    """Log warning messages in yellow color."""
    print(f"{Colors.YELLOW}WARNING: {message}{Colors.END}")
    if details:
        print(f"{Colors.YELLOW}   └─ {details}{Colors.END}")


def log_error(message: str, details: str = None, error: Exception = None):
    """Log error messages in red color."""
    print(f"{Colors.RED}ERROR: {message}{Colors.END}")
    if details:
        print(f"{Colors.RED}   └─ {details}{Colors.END}")
    if error:
        print(f"{Colors.RED}   └─ Exception: {str(error)}{Colors.END}")


def log_debug(message: str, details: str = None):
    """Log debug messages in cyan color."""
    print(f"{Colors.CYAN}DEBUG: {message}{Colors.END}")
    if details:
        print(f"{Colors.CYAN}   └─ {details}{Colors.END}")


def log_step(step_name: str, details: str = None):
    """Log pipeline step messages in magenta color."""
    print(f"{Colors.MAGENTA}{Colors.BOLD}STEP: {step_name}{Colors.END}")
    if details:
        print(f"{Colors.MAGENTA}   └─ {details}{Colors.END}")


def log_timing(operation: str, duration: float):
    """Log timing information in cyan color."""
    print(f"{Colors.CYAN}TIMING: {operation} completed in {duration:.2f}s{Colors.END}")


def log_pipeline_start(query: str):
    """Log pipeline start with formatted query (truncated if too long)."""
    truncated_query = query[:100] + "..." if len(query) > 100 else query
    print(f"\n{Colors.BOLD}{Colors.WHITE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.WHITE}PIPELINE START{Colors.END}")
    print(f"{Colors.WHITE}Query: {truncated_query}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.WHITE}{'='*60}{Colors.END}")


def log_pipeline_end(duration: float):
    """Log pipeline completion with total time."""
    print(f"{Colors.BOLD}{Colors.WHITE}{'='*60}{Colors.END}")
    print(f"{Colors.GREEN}{Colors.BOLD}PIPELINE COMPLETED{Colors.END}")
    print(f"{Colors.GREEN}Total time: {duration:.2f}s{Colors.END}")
    print(f"{Colors.BOLD}{Colors.WHITE}{'='*60}{Colors.END}\n")


def clean_response(response: Dict[str, Any]) -> Any:
    """
    Extract and clean JSON content from LLM API response.

    Processes the response from an LLM API call by extracting the content from the message,
    removing JSON code block markers, and parsing it into a Python object using pydantic.

    Args:
        response: Dictionary containing the full API response with nested structure
                 Expected to have response["choices"][0]["message"]["content"] path

    Returns:
        Any: Parsed Python object from the JSON content, allowing partial parsing for incomplete JSON
    """
    response = response["choices"][0]["message"]["content"]
    response = response.replace("json", "").replace("", "")
    return from_json(response, allow_partial=True)


def call_with_retry(
    func, max_retries=3, delay=1, exceptions=(Exception,), *args, **kwargs
) -> Any:
    """
    Execute a function with automatic retry logic on exceptions.

    Attempts to call the provided function up to max_retries times, with a delay
    between attempts. If all retries are exhausted, raises the last encountered exception.

    Args:
        func: The function to execute with retry logic
        max_retries: Maximum number of retry attempts (default: 3)
        delay: Time in seconds to wait between retry attempts (default: 1)
        exceptions: Tuple of exception types to catch and retry on (default: (Exception,))
        *args: Positional arguments to pass to the function
        **kwargs: Keyword arguments to pass to the function

    Returns:
        Any: The return value of the successfully executed function

    Raises:
        Exception: The last exception encountered if all retry attempts fail
    """
    for attempt in range(max_retries):
        try:
            return func(*args, **kwargs)
        except exceptions as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(delay)
