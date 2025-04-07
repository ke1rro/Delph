import base64
import json
import sys

from cryptography.hazmat.primitives import serialization


def generate_jwks(key: bytes, key_id: str) -> dict:
    """
    Generate a JSON Web Key Set (JWKS) from a PEM key.

    Args:
        key: PEM-encoded public key.
        key_id: Key ID to be used in the JWKS.

    Returns:
        A dictionary representing the JWKS.
    """
    key = serialization.load_pem_public_key(key)

    n = key.public_numbers().n.to_bytes(
        (key.public_numbers().n.bit_length() + 7) // 8, byteorder="big"
    )
    e = key.public_numbers().e.to_bytes(
        (key.public_numbers().e.bit_length() + 7) // 8, byteorder="big"
    )

    return {
        "keys": [
            {
                "kty": "RSA",
                "use": "sig",
                "alg": "RS256",
                "kid": key_id,
                "n": base64.urlsafe_b64encode(n).decode("utf-8"),
                "e": base64.urlsafe_b64encode(e).decode("utf-8"),
            }
        ]
    }


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python generate_jwks.py <key_id>")
        sys.exit(1)

    key_id = sys.argv[1]
    key = sys.stdin.read().encode("utf-8")

    jwks = generate_jwks(key, key_id)

    json.dump(jwks, sys.stdout)
