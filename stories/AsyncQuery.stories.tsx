import React, { useContext, useState } from 'react';
import { Meta, Story } from '@storybook/react';
import { UsersService } from './services/users/UsersService';
import { IUser } from './services/users/IUser';
import { QueryContextProvider, useMutation, useNamedQuery, useQuery } from '../src';
import { QueryContext } from '../src/QueryContextProvider';

const meta: Meta = {
  title: 'Async Query',
};

export default meta;

const TAKE = 3;

const USERS_SVC = new UsersService();

const DefaultTemplate: Story = args => {
  const [count, setCount] = useState<number>(0);
  
  const [skip, setSkip] = useState<number>(0);
  const usersListQuery = useQuery/*<IUser[], [number, number], MyErrorType>*/(
    USERS_SVC.fetchListAsync, [skip, TAKE],  
  );

  const [isCreateUserExecuting, createUserError, createUserAsync] = useMutation(async () => {
    await USERS_SVC.createAsync('NEW USER');
  });

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <br /><br />
      <button disabled={isCreateUserExecuting} onClick={createUserAsync}>Create</button>
      {createUserError && 'Create user Error: ' + createUserError.message}
      <br />
      {usersListQuery.isExecuting && <>Please wait...<br /></>}
      {usersListQuery.data && <UsersList users={usersListQuery.data} />}
      {usersListQuery.error && 'Fetch list Error: ' + usersListQuery.error.message}
      <br />
      <Pagination skip={skip} take={TAKE} isExecuting={usersListQuery.isExecuting} onRefresh={usersListQuery.startRefresh} onSkipChanged={setSkip} />
    </div>
  );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = DefaultTemplate.bind({});
Default.args = {};

function WithContextTemplateInner() {
  const [count, setCount] = useState<number>(0);
  
  const [skip, setSkip] = useState<number>(0);
  const usersListQuery = useNamedQuery/*<IUser[], [number, number], MyErrorType>*/(
    'users-list',
    USERS_SVC.fetchListAsync, [skip, TAKE],  
  );

  const [isCreateUserExecuting, createUserError, createUserAsync] = useMutation(async () => {
    await USERS_SVC.createAsync('NEW USER');
    usersListQuery.startRefresh();
  });

  return (
    <div>
      PANDA
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <br /><br />
      <button disabled={isCreateUserExecuting} onClick={createUserAsync}>Create</button>
      {createUserError && 'Create user Error: ' + createUserError.message}
      <br />
      {usersListQuery.isExecuting && <>Please wait...<br /></>}
      {usersListQuery.data && <UsersList users={usersListQuery.data} />}
      {usersListQuery.error && 'Fetch list Error: ' + usersListQuery.error.message}
      <br />
      <Pagination skip={skip} take={TAKE} isExecuting={usersListQuery.isExecuting} onRefresh={usersListQuery.startRefresh} onSkipChanged={setSkip} />
    </div>
  );
}

const WithContextTemplate: Story = args => {
  return (
    <QueryContextProvider>
      <WithContextTemplateInner />
    </QueryContextProvider>
  );
}

export const WithContext = WithContextTemplate.bind({});
WithContext.args = {};

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
  const ctx = useContext(QueryContext);
  const [checked, setChecked] = useState<boolean>(props.user.isActive);
  return (
    <div style={{ borderBottom: '1px solid gray', minHeight: '120px'}}>
      #{props.user.id}
      <br /><br />
      <input type="checkbox" checked={checked} onChange={(ev) => {
        if (ctx) {
          ctx.startRefresh('users-list');
        } else {
          setChecked(ev.target.checked);
        }
      }} /> {props.user.username}
    </div>
  );
}

