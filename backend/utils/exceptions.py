from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return response

    data = response.data
    if isinstance(data, dict):
        if "detail" in data:
            response.data = {"detail": str(data["detail"]), "errors": {}}
        else:
            first_message = "Please check the form and try again."
            for value in data.values():
                if isinstance(value, list) and value:
                    first_message = str(value[0])
                    break
                if isinstance(value, str):
                    first_message = value
                    break
            response.data = {"detail": first_message, "errors": data}
    elif isinstance(data, list) and data:
        response.data = {"detail": str(data[0]), "errors": {"non_field_errors": data}}
    else:
        response.data = {"detail": "Something went wrong.", "errors": {}}

    return response

