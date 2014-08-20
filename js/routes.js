App.ApplicationRoute = Em.Route.extend({
  setupController:function(controller, model){
    this.startGlobalTime();
  },
  startGlobalTime: function() {
    var controller = this.get('controller');
    controller.set('now', Date.now());
    Ember.run.later(this, this.startGlobalTime, 2000);
  }
});

App.HelpRoute = Ember.Route.extend({
  model: function() {
    return this.store.createRecord('ticket');
  }
});

App.TicketRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.find('ticket', params.ticket_id)
  },
  renderTemplate: function() {
    this.render('queued');
  }
});

App.QueueRoute = Ember.Route.extend({
  model: function() {
    return this.store.find('ticket');
  }
});

App.StatisticsRoute = Ember.Route.extend({
  model: function() {
    return this.store.find('ticket');
  }
})

