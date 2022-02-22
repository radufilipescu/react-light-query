import { createResolvedPromise } from '../../../src';
import { IUser } from "./IUser";

let id = 0;
const DATA: IUser[] = [
  {
    id: id++,
    username: 'Bashful',
    isActive: true
  },
  {
    id: id++,
    username: 'Doc',
    isActive: true
  },
  {
    id: id++,
    username: 'Dopey',
    isActive: true
  },
  {
    id: id++,
    username: 'Grumpy',
    isActive: true
  },
  {
    id: id++,
    username: 'Happy',
    isActive: true
  },
  {
    id: id++,
    username: 'Sleepy',
    isActive: true
  },
  {
    id: id++,
    username: 'Sneezy',
    isActive: true
  },
];

export class UsersService {
  async fetchListAsync(skip: number, take: number): Promise<IUser[]> {
    console.log(`UsersService.fetchListAsync(skip: ${skip}, take: ${take})`);
    return createResolvedPromise(DATA.slice(skip, skip + take).map(user => ({ ...user })), 1000);
  }

  async createAsync(name: string): Promise<void> {
    console.log(`UsersService.createAsync(name: ${name})`);
    return createResolvedPromise(void(0), 1000)
  }
}