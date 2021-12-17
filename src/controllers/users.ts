import { Request, Response } from 'express';
import UserModel from '@entities/User';

// get users
const getUsers = async (req: Request, res: Response): Promise<any> => {    
    const users = await UserModel.find({});    

    // return response
    return res.status(200).json(users);
};


export default { getUsers };
