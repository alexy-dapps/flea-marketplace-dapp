ngOnInit() {
  this.network$ = this.store.pipe(select(fromRoot.getNetwork));
  this.balance$ = this.store.pipe(select(fromRoot.getBalance));
}

ngAfterViewInit() {

  this.account$ = this.store.pipe(select(fromRoot.getAccount)).pipe(
    tap(account => {
      this.blockyRef.nativeElement.src =
        create({ seed: account, size: 8, scale: 4 }).toDataURL();
    })
  );
}