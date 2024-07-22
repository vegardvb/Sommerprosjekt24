"""
Module for defining status codes and their descriptions.
"""

henvendelse_status_dict = {
    -2: "Avventer system",
    1: "Registrert",
    2: "Under behandling",
    3: "Til behandling av netteier",
    4: "Behandlet",
    5: "Venter på svar fra kunde",
    6: "Annullert av Geomatikk",
    7: "Annullert av kunde",
    8: "Kompletert sak",
    9: "Prisforespørsel",
    10: "Tilbud sendt",
    11: "Fakturert",
    12: "Avventer GIS eksport",
    14: "Venter på svar fra netteier (uten avtale)",
    15: "Testing",
    22: "Venter på tillatelse fra netteiere",
}


def get_henvendelse_status(status_code):
    """
    Get the status description for a given status code.

    Args:
        status_code (int): The status code.

    Returns:
        str: The status description.

    Raises:
        KeyError: If the status code is not found in the dictionary.
    """
    return henvendelse_status_dict[status_code]
