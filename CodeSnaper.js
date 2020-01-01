ngOnInit() {
  this.account$ = this.store.pipe(select(fromRoot.getAccount));
  this.network$ = this.store.pipe(select(fromRoot.getNetwork));
  this.balance$ = this.store.pipe(select(fromRoot.getBalance));
}