import React from 'react';
import Loadable from 'react-loadable'

import DefaultLayout from './containers/DefaultLayout';
import LandingLayout from './landing/LandingLayout';

function Loading() {
  return <div>Loading...</div>;
}


const Dashboard = Loadable({
  loader: () => import('./views/Dashboard'),
  loading: Loading,
});

const Escrows = Loadable({
  loader: () => import('./views/Base/Escrows/Escrows'),
  loading: Loading,
});

const CreateEscrow = Loadable({
  loader: () => import('./views/Base/CreateEscrow/Createescrow'),
  loading: Loading,
});

const Settings = Loadable({
  loader: () => import('./views/Users/Settings'),
  loading: Loading,
});

const Roadmap = Loadable({
  loader: () => import('./views/Roadmap/Roadmap'),
  loading: Loading,
});





// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/', exact: true, name: 'Home', component: DefaultLayout },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/escrows/:id', exact: true, name: 'Escrows', component: Escrows },
  { path: '/escrows', exact: true, name: 'Escrows', component: Escrows },
  { path: '/create', exact: true, name: 'Create', component: CreateEscrow },
  { path: '/settings', exact: true, name: 'Settings', component: Settings },
  { path: '/roadmap', exact: true, name: 'Roadmap', component: Roadmap },

];

export default routes;
