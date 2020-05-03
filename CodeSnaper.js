{
  path: 'market-place',

    loadChildren: () => import('./market-place/market-place.module').then(mod => mod.MarketPlaceModule),
      canLoad: [guards.MetaMaskConnectGuard, guards.IpfsConnectGuard],
}
