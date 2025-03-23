from livekit import api
import os

token = api.AccessToken(api_key='devkey', api_secret='secret') \
    .with_identity("python-bot") \
    .with_name("Python Bot") \
    .with_grants(api.VideoGrants(
        room_join=True,
        room="my-room",
    )).to_jwt()

print(f"TOKEN: {token}")
