App.Router.map(function() {
  this.route('help', { path: '/' });
  this.route('ticket', { path: '/ticket/:ticket_id' });
  this.route('queue');
  this.route('statistics');
});

