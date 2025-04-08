import request from 'supertest';
import {app} from '../../index';
import * as user_module from '../../users';
import { Types } from 'mongoose';

jest.mock('../../users');

describe('GET /remove-user-from-house/:userID/:houseID/:user_making_req_ID', () => {
  const validUserId = new Types.ObjectId("111222333444555666777888").toString();
  const validHouseId = new Types.ObjectId("aaaabbbbccccddddeeeeffff").toString();
  const validOwnerId = new Types.ObjectId("123456789abcdef123456789").toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 400 if IDs are invalid', async () => {
    const response = await request(app).get("/remove-user-from-house/invalid/invalid/invalid");
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Error parsing IDs/);
  });

  test('should return 401 if user is not the owner', async () => {
    (user_module.is_owner as jest.Mock).mockResolvedValue(false);

    const response = await request(app).get(
      `/remove-user-from-house/${validUserId}/${validHouseId}/${validOwnerId}`
    );
    expect(response.status).toBe(401);
    expect(response.body.error).toMatch(/not the owner/);
  });

  test('should call remove_user_from_house if user is owner ', async () => {
    (user_module.is_owner as jest.Mock).mockResolvedValue(true);
    (user_module.remove_user_from_house as jest.Mock).mockResolvedValue(undefined);
    (user_module.get_all_users_in_house as jest.Mock).mockResolvedValue([]);

    const response = await request(app).get(
      `/remove-user-from-house/${validUserId}/${validHouseId}/${validOwnerId}`
    );

    expect(user_module.is_owner).toHaveBeenCalledWith(expect.any(Types.ObjectId), expect.any(Types.ObjectId));
    expect(user_module.remove_user_from_house).toHaveBeenCalledWith(expect.any(Types.ObjectId), expect.any(Types.ObjectId));
    expect(user_module.get_all_users_in_house).toHaveBeenCalledWith(expect.any(Types.ObjectId));
    expect(response.status).not.toBe(400);
  });

  test('should return 401 if remove_user_from_house throws', async () => {
    (user_module.is_owner as jest.Mock).mockResolvedValue(true);
    (user_module.remove_user_from_house as jest.Mock).mockRejectedValue(new Error('fail'));

    const response = await request(app).get(
      `/remove-user-from-house/${validUserId}/${validHouseId}/${validOwnerId}`
    );
    expect(response.status).toBe(401);
    expect(response.body.error).toMatch(/Failed to remove user/);
  });
});
