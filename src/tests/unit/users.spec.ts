// importing user related functions

import { Types } from "mongoose";
//import {user, validate_email, validate_names,  create_user, change_first_name, change_last_name, change_email}  from "../../users" ;
//import {house, membersInHouse, create_house, delete_house, get_all_users_in_house, find_owner, is_owner, is_in_house, change_owner, remove_user_from_house} from "../../users"
import * as users from "../../users";


// importing schemas

// importing house related functions

// ### USER FUNCTION TESTING ###

describe ("Validate Email", () =>{
    beforeEach(() => {
        jest.clearAllMocks();
        Object.defineProperty(users, "testing", { value: true });
    })

    afterEach(() => {
        jest.restoreAllMocks();
    });

    //VALIDATE EMAILS

    test("Returns true when typical valid email passed in", async () => {

        jest.spyOn(users.user, "findOne").mockResolvedValue(null);
        const valid_email = await users.validate_email("xyz12345@bath.ac.uk");
        await expect(valid_email).toBe(true);

    });

    test("returns true when both uppercase and lowercase used", async() => {

        jest.spyOn(users.user, "findOne").mockResolvedValue(null);
        const valid_email = await users.validate_email("UPPERCASEandlowercase@gmail.com");
        await expect(valid_email).toBe(true);
        
    })

    test("return false if email contains non-standard symbols", async() => {

        jest.spyOn(users.user, "findOne").mockResolvedValue(null);
        const valid_email = await users.validate_email("symbols/are/bad@gmail.com");
        await expect(valid_email).toBe(false);
        
    })

    test("return false if domain name is badly structured", async() => {

        jest.spyOn(users.user, "findOne").mockResolvedValue(null);
        const valid_email = await users.validate_email("baddomain@outlook..com");
        await expect(valid_email).toBe(false);
        
    })

    test("return false if email is valid but already exists in database", async() => {

        jest.spyOn(users.user, "findOne").mockResolvedValue("john@example.com");
        const valid_email = await users.validate_email("john@example.com");
        await expect(valid_email).toBe(false);
        
    })

});

describe ("create user fucntions", () => {

    var valid_data = {firstName: "Logan",lastName: "Paul",email: "whatsuplogang420@gmail.com"};

    beforeEach(() => {
        jest.clearAllMocks();
        Object.defineProperty(users, "testing", { value: true });
        jest.spyOn(users.user, "create").mockResolvedValue({_id: "mockid", ...valid_data} as any);
    })

    afterEach(() => {
        jest.restoreAllMocks();
        valid_data = {firstName: "Logan",lastName: "Paul",email: "whatsuplogang420@gmail.com"};
    })

    test("Account created when all parameters are valid", async () => {

        await users.create_user(valid_data.firstName, valid_data.lastName, valid_data.email);
        expect(users.user.create).toHaveBeenCalledWith(expect.objectContaining(valid_data));
        
    })

    test("Account not created when firstname too short", async () => {

        valid_data.firstName = "";
        await users.create_user(valid_data.firstName, valid_data.lastName, valid_data.email);
        expect(users.user.create).not.toHaveBeenCalled();
        
    })

    test("Account not created when firstname contains numbers or symbols", async () => {

        valid_data.firstName = "symbol$$";
        await users.create_user(valid_data.firstName, valid_data.lastName, valid_data.email);
        expect(users.user.create).not.toHaveBeenCalled();

        valid_data.firstName = "number123";
        await users.create_user(valid_data.firstName, valid_data.lastName, valid_data.email);
        expect(users.user.create).not.toHaveBeenCalled();
        
    })


    test("Account created when firstname 15 letters long (on boundary)", async () => {

        valid_data.firstName = "aaabbbcccdddeee";
        await users.create_user(valid_data.firstName, valid_data.lastName, valid_data.email);
        expect(users.user.create).toHaveBeenCalledWith(expect.objectContaining(valid_data));
        
    })

    test("Account not created when firstname 16 letters long (past boundary)", async () => {

        valid_data.firstName = "aaabbbcccdddeeef";
        await users.create_user(valid_data.firstName, valid_data.lastName, valid_data.email);
        expect(users.user.create).not.toHaveBeenCalled();
        
    })

    test("Account not created when lastname too short", async () => {

        valid_data.lastName = "";
        await users.create_user(valid_data.firstName, valid_data.lastName, valid_data.email);
        expect(users.user.create).not.toHaveBeenCalled();
        
    })

    test("Account created when lastname 15 letters long (on boundary)", async () => {

        valid_data.lastName = "aaabbbcccdddeee";
        await users.create_user(valid_data.firstName, valid_data.lastName, valid_data.email);
        expect(users.user.create).toHaveBeenCalledWith(expect.objectContaining(valid_data));
        
    })

    test("Account not created when lastname 16 letters long (past boundary)", async () => {

        valid_data.lastName = "aaabbbcccdddeeef";
        await users.create_user(valid_data.firstName, valid_data.lastName, valid_data.email);
        expect(users.user.create).not.toHaveBeenCalled();
        
    })

    test("Account not created when lastname contains numbers or symbols", async () => {

        valid_data.lastName = "symbol$$";
        await users.create_user(valid_data.firstName, valid_data.lastName, valid_data.email);
        expect(users.user.create).not.toHaveBeenCalled();

        valid_data.lastName = "number123";
        await users.create_user(valid_data.firstName, valid_data.lastName, valid_data.email);
        expect(users.user.create).not.toHaveBeenCalled();
        
    })
    
})

describe ("Change parameters", () => {

    var valid_data = {firstName: "Logan",lastName: "Paul",email: "whatsuplogang420@gmail.com"};
    var mock_id = new Types.ObjectId("123456789abcdef123456789");
    var new_first_name = "Jake";
    var new_last_name = "Nagol"
    var new_email = "maverick4ever@gmail.com"

    beforeEach(() => {
        jest.restoreAllMocks();

        valid_data = {firstName: "Logan",lastName: "Paul",email: "whatsuplogang420@gmail.com"};
        var mock_id = new Types.ObjectId("123456789abcdef123456789");
        var new_first_name = "Jake";
        var new_last_name = "Nagol"
        var new_email = "maverick4ever@gmail.com"

        Object.defineProperty(users, "testing", { value: true });
        jest.spyOn(users.user, "create").mockResolvedValue({_id: "mockid", ...valid_data} as any);
        jest.spyOn(users.user, "findOneAndUpdate").mockResolvedValue({
            _id: mock_id, 
            firstName: new_first_name
        } as any);
        jest.spyOn(users.user, "findById").mockResolvedValue(valid_data)

    })


    test("firstName change successful on valid data", async () => { // changing first name to jake

        await users.change_first_name(mock_id, new_first_name);
        expect(users.user.findOneAndUpdate).toHaveBeenCalled();
    })

    test("firstName change fail on invalid data", async () => {

        new_first_name = "";

        await users.change_first_name(mock_id, new_first_name);
        expect(users.user.findOneAndUpdate).not.toHaveBeenCalled();

        new_first_name = "abcdefghijklmnopqrstuvwxyz";

        await users.change_first_name(mock_id, new_first_name);
        expect(users.user.findOneAndUpdate).not.toHaveBeenCalled();

        new_first_name = "*symbol*";

        await users.change_first_name(mock_id, new_first_name)
        expect(users.user.findOneAndUpdate).not.toHaveBeenCalled();

        new_first_name = "numb3rs";

        await users.change_first_name(mock_id, new_first_name);
        expect(users.user.findOneAndUpdate).not.toHaveBeenCalled();
        
    })

    test("firstName change fail if it is the same as old name", async() => {
        new_first_name = "Logan";
        await users.change_first_name(mock_id, new_first_name);
        expect(users.user.findOneAndUpdate).not.toHaveBeenCalled();
    })

    test("lastName change successful on valid data", async() => {

        await users.change_last_name(mock_id, new_last_name);
        expect(users.user.findOneAndUpdate).toHaveBeenCalled();
    })

    test("LastName change fails on invalid data", async () => {

        new_last_name = "abcdefghijklmnopqrstuvwxyz";

        await users.change_last_name(mock_id, new_last_name);
        expect(users.user.findOneAndUpdate).not.toHaveBeenCalled();

        new_last_name = "*symbol*";

        await users.change_last_name(mock_id, new_last_name);
        expect(users.user.findOneAndUpdate).not.toHaveBeenCalled();

        new_last_name = "numb3rs";

        await users.change_last_name(mock_id, new_last_name);
        expect(users.user.findOneAndUpdate).not.toHaveBeenCalled();

    })

    test("lastName change fail if it is the same as old name", async() => {
        new_last_name = "Paul";
        await users.change_last_name(mock_id, new_last_name);
        expect(users.user.findOneAndUpdate).not.toHaveBeenCalled();
    })

    test("email change successful on valid data", async () => {

        await users.change_email(mock_id, new_email);
        expect(users.user.findOneAndUpdate).toHaveBeenCalled();

    })

    test("email change fails on invalid data", async () => {

        new_email = "notgoodemail"
        await users.change_email(mock_id, new_email);
        expect(users.user.findOneAndUpdate).toHaveBeenCalled();

        new_email = "doesn'tcontainsymbols@yahoo.com";
        await users.change_email(mock_id, new_email);
        expect(users.user.findOneAndUpdate).toHaveBeenCalled();

        new_email = "";
        await users.change_email(mock_id, new_email);
        expect(users.user.findOneAndUpdate).toHaveBeenCalled();

    })

})



describe ("house creation", () => {

    var mock_owner = new Types.ObjectId("123456789abcdef123456789");

    var valid_house_data = {ownerID: mock_owner, houseName: "Example House", dateCreated: new Date};
    var valid_members_in_house_data = { userID: mock_owner, houseID: new Types.ObjectId("987654321abcdef987654321")}

    beforeEach(() => {

        jest.restoreAllMocks();

        Object.defineProperty(users, "testing", { value: true });
        jest.spyOn(users.house, "create").mockResolvedValue({_id: "mockid1", ...valid_house_data} as any);
        jest.spyOn(users.membersInHouse, "create").mockResolvedValue({_id: "mockid2", ...valid_members_in_house_data} as any)
    })

    test ("Create house successfuly when valid data enetered", async () => {

        await users.create_house(valid_house_data.ownerID, valid_house_data.houseName); // initial data
        expect(users.house.create).toHaveBeenCalledTimes(1)
        expect(users.membersInHouse.create).toHaveBeenCalledTimes(1)
        
        jest.restoreAllMocks()
    })

    test ("Single letter house name is valid", async () => {
        valid_house_data.houseName = "z";

        await users.create_house(valid_house_data.ownerID, valid_house_data.houseName);
        expect(users.house.create).toHaveBeenCalledTimes(1)
        expect(users.membersInHouse.create).toHaveBeenCalledTimes(1)

        
    })

    test ("Length 50 house name is valid", async() => {

        valid_house_data.houseName = "aaaaabbbbbcccccdddddeeeeefffffggggghhhhhiiiiijjjjj"; // length 50

        await users.create_house(valid_house_data.ownerID, valid_house_data.houseName);
        expect(users.house.create).toHaveBeenCalledTimes(1)
        expect(users.membersInHouse.create).toHaveBeenCalledTimes(1)

    })

    test("Numbers and symbols permitted in house names", async () => {

        valid_house_data.houseName = "numb3rs and $ymbol$ are fine";

        await users.create_house(valid_house_data.ownerID, valid_house_data.houseName);
        expect(users.house.create).toHaveBeenCalledTimes(1)
        expect(users.membersInHouse.create).toHaveBeenCalledTimes(1)

    })

    
    test ("Create house fails when invalid data entered", async () => {

        valid_house_data.houseName = "";

        await users.create_house(valid_house_data.ownerID, valid_house_data.houseName);
        expect(users.house.create).not.toHaveBeenCalled()
        expect(users.membersInHouse.create).not.toHaveBeenCalled()

        valid_house_data.houseName = "aaaaabbbbbcccccdddddeeeeefffffggggghhhhhiiiiijjjjjk"; // length 51

        await users.create_house(valid_house_data.ownerID, valid_house_data.houseName);
        expect(users.house.create).not.toHaveBeenCalled()
        expect(users.membersInHouse.create).not.toHaveBeenCalled()

    })
})

// todo:
// find owner

// is owner

describe("is owner", () => {

    let member: Types.ObjectId;
    let owner: Types.ObjectId;
    let house_1: Types.ObjectId;
    let house_2: Types.ObjectId;

    beforeEach(() => {

        jest.restoreAllMocks();

        member = new Types.ObjectId("abcdefabcdefabcdefabcdef");
        owner = new Types.ObjectId("111222333444555666777888");
        house_1 = new Types.ObjectId("888777666555444333222111");
        house_2 = new Types.ObjectId("aaaabbbbccccddddeeeeffff");

        jest.spyOn(users, "find_owner").mockImplementation(
            async(house_id) => {
                if(house_id.equals(house_1)){
                    return owner;
                }
                else{
                    return null;
                }
            }
        )
    })

    test("return true on valid house and correct owner", async () => {

        const result = await users.is_owner(house_1, owner);
        expect(result).toBe(true);

    })
    test("return false on valid house and incorrect owner", async () => {

        const result = await users.is_owner(house_1, member);
        expect(result).toBe(false);

    })
    test("return false on invalid house", async () => {

        const result = await users.is_owner(house_2, owner);
        expect(result).toBe(false);

    })

})

// is in house

describe("is in house", () => {

    let members_1: string[];
    let house_1: Types.ObjectId;
    let members_2: string[];
    let house_2: Types.ObjectId;

    let not_in_house: Types.ObjectId;
    let in_house: Types.ObjectId;

    beforeEach(() => {

        members_1 = [
            "abcdefabcdefabcdefabcdef",
            "123456123456123456123456",
            "111122223333444455556666",
            "123456789123456789abcdef"
        ];
        members_2 = [];
        house_1 = new Types.ObjectId("abcdef123456789123456789");
        house_2 = new Types.ObjectId("888777666555444333222111");
        
        not_in_house = new Types.ObjectId("aaaabbbbccccddddeeeeffff");
        in_house = new Types.ObjectId("123456789123456789abcdef");

        jest.spyOn(users, "get_all_users_in_house").mockImplementation(
            async (house_id) => {
                if(house_id.equals(house_1)){
                    return members_1;
                }
                else{
                    return members_2;
                }
            }
        )
    })

    test("User is in house", async () => {
        const result = await users.is_in_house(house_1, in_house);
        expect(result).toBe(true);
    });

    test("User is not in house", async () => {
        const result = await users.is_in_house(house_1, not_in_house);
        expect(result).toBe(false);
    });

    test("House with no members", async () => {
        const result = await users.is_in_house(house_2, in_house);
        expect(result).toBe(false);
    });

})


// change owner


// remove user

describe("remove user and change owner", () => {

    var mock_owner_id = new Types.ObjectId("abcdefabcdefabcdefabcdef")
    var mock_member_id = new Types.ObjectId("123456789123456789abcdef")
    var mock_not_in_house_id = new Types.ObjectId("aaaaaabbbbbbccccccdddddd")
    var mock_house_id = new Types.ObjectId("abcdef123456789123456789")

    let log_spy = 0;

    const is_in_house_mock = jest.spyOn(users, "is_in_house").mockImplementation(
        async (house_id, user_id) => {
            if (house_id.equals(mock_house_id) && (user_id.equals(mock_member_id) || user_id.equals(mock_owner_id))){ // in house
                return true;
            }
            else if (house_id.equals(mock_house_id) && user_id.equals(mock_not_in_house_id)){ // not in house
                return false;
            }
            else{
                return false;
            }
        }
    )
    const find_owner_mock = jest.spyOn(users, "find_owner").mockResolvedValue(mock_owner_id);

    beforeEach(() => {

        jest.restoreAllMocks();

        jest.spyOn(global.console, "log");

        var mock_owner_id = new Types.ObjectId("abcdefabcdefabcdefabcdef")
        var mock_member_id = new Types.ObjectId("123456789123456789abcdef")
        var mock_not_in_house_id = new Types.ObjectId("aaaaaabbbbbbccccccdddddd")
        var mock_house_id = new Types.ObjectId("abcdef123456789123456789")

        Object.defineProperty(users, "testing", { value: true });

        jest.spyOn(users, "find_owner").mockResolvedValue(mock_owner_id);

        jest.spyOn(users, "is_in_house").mockImplementation(
            async (house_id, user_id) => {
                if (house_id.equals(mock_house_id) && (user_id.equals(mock_member_id) || user_id.equals(mock_owner_id))){ // in house
                    return true;
                }
                else if (house_id.equals(mock_house_id) && user_id.equals(mock_not_in_house_id)){ // not in house
                    return false;
                }
                else{
                    return false;
                }
            }
        )
        
        jest.spyOn(users.membersInHouse, "deleteOne").mockResolvedValue({deletedCount: 1} as any);
        jest.spyOn(users.house, "updateOne").mockResolvedValue({modifiedCount: 1} as any);

    })

    test("Successfully removes user when member and not owner of house", async () =>{

        const result = await users.remove_user_from_house(mock_member_id,mock_house_id);
        expect(users.membersInHouse.deleteOne).toHaveBeenCalledTimes(1);
        
    })

    test("fail to remove user if userid not in house", async () => {
        await users.remove_user_from_house(mock_not_in_house_id,mock_house_id);
        expect(global.console.log).toHaveBeenCalledWith("remove_user_from_house failed: user to be removed must be in house");
        expect(users.membersInHouse.deleteOne).not.toHaveBeenCalled();
    })

    test("fail to remove user if user is owner", async () => {
        await users.remove_user_from_house(mock_owner_id,mock_house_id);
        expect(global.console.log).toHaveBeenCalledWith("remove_user_from_house failed: user to be removed cannot be owner of house");
        expect(users.membersInHouse.deleteOne).not.toHaveBeenCalled();
    })

    test("success to change owner on valid data", async() => {

        await users.change_owner(mock_member_id, mock_house_id);
        expect(users.house.updateOne).toHaveBeenCalledTimes(1);

    })

    test("fail to change owner if member is not in house", async() => {
        await users.change_owner(mock_not_in_house_id, mock_house_id);
        expect(global.console.log).toHaveBeenCalledWith("change_owner function failed: new owner must be in house")
        expect(users.house.updateOne).not.toHaveBeenCalled();
    })

    test("fail to change owner if new owner is the same old owner", async() => {
        await users.change_owner(mock_owner_id, mock_house_id);
        expect(global.console.log).toHaveBeenCalledWith("change_owner function failed: new owner cannot be the same as old owner")
        expect(users.house.updateOne).not.toHaveBeenCalled();
    })
})

