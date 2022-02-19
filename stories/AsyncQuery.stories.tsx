import React, { useState } from 'react';
import { Meta, Story } from '@storybook/react';
import { useRef } from '@storybook/addons';
import { UsersService } from './services/users/UsersService';
import { IUser } from './services/users/IUser';
import { useAsyncCommand, useAsyncQuery } from '../src';

const meta: Meta = {
  title: 'Async Query'
};

export default meta;

const TAKE = 3;

const DefaultTemplate: Story = args => {
  const usersSvcRef = useRef(new UsersService());
  
  const [skip, setSkip] = useState<number>(0);

  const [users, setUsers] = useState<IUser[]>([]);
  const [isFetchingUsersList, usersListFetchingError, refreshUsersList] = useAsyncQuery/*<IUser[], [number, number], MyErrorType>*/(
    usersSvcRef.current.fetchListAsync, [skip, TAKE], 
    setUsers
  );

  const [isCreateUserExecuting, createUserError, createUserAsync] = useAsyncCommand(async () => {
    await usersSvcRef.current.createAsync('NEW USER');
  });

  return (
    <div>
      <button disabled={isCreateUserExecuting} onClick={createUserAsync}>Create</button>
      {createUserError && 'Create user Error: ' + createUserError.message}
      <br />
      {isFetchingUsersList && <>Please wait...<br /></>}
      <UsersList users={users} />
      {usersListFetchingError && 'Fetch list Error: ' + usersListFetchingError.message}
      <br />
      <Pagination skip={skip} take={TAKE} isExecuting={isFetchingUsersList} onRefresh={refreshUsersList} onSkipChanged={setSkip} />
    </div>
  )
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = DefaultTemplate.bind({});

Default.args = {};

interface IPaginationProps {
  readonly skip: number;
  readonly take: number;
  readonly isExecuting: boolean;
  readonly onSkipChanged: (skip: number) => void;
  readonly onRefresh: () => void;
}

function Pagination(props: IPaginationProps) {
  return <>
    <button disabled={props.isExecuting || props.skip <= 0} onClick={() => props.onSkipChanged(props.skip - props.take)}>Prev</button>
    &nbsp;PAGE: {(props.skip / TAKE) + 1}&nbsp;
    <button disabled={props.isExecuting} onClick={() => props.onSkipChanged(props.skip + props.take)}>Next</button>
    &nbsp;&nbsp;&nbsp;
    <button disabled={props.isExecuting} onClick={props.onRefresh}>Refresh</button>
  </>;
}

interface IUsersListProps {
  readonly users: IUser[];
}

function UsersList(props: IUsersListProps) {
  return (
    <div style={{ width: '200px', minHeight: '300px'}}>
      {props.users.map(user => <UsersListItem key={user.id} user={user} />)}
    </div>
  )
}

interface IUsersListItemProps {
  readonly user: IUser;
}

function UsersListItem(props: IUsersListItemProps) {
  return (
    <div style={{ borderBottom: '1px solid gray', minHeight: '120px'}}>
      #{props.user.id}
      <br /><br />
      <input type="checkbox" defaultChecked={props.user.isActive} /> {props.user.username}
    </div>
  );
}

