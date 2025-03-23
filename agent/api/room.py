from livekit import api
import asyncio

async def main():
    lkapi = api.LiveKitAPI("http://127.0.0.1:7880",api_key='devkey', api_secret='secret')
    room_info = await lkapi.room.create_room(
        api.CreateRoomRequest(name="hursun"),
    )
    print(room_info)
    results = await lkapi.room.list_rooms(api.ListRoomsRequest())
    print(results)

asyncio.run(main())