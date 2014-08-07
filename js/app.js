App = Ember.Application.create();

App.Router.map(function() {
  this.route('help');
  this.route('queue');
});

// Routes
App.HelpRoute = Ember.Route.extend({
  model: function() {
    return this.store.createRecord('ticket')
  }
});

App.QueueRoute = Ember.Route.extend({
  model: function() {
    return this.store.find('ticket');
  }
});

// Controllers
App.HelpController = Ember.ObjectController.extend({
  actions: {
    createTicket: function() {
      this.get('model').set('open', true).save();
    }
  }
});

App.QueueController = Ember.ArrayController.extend({
  actions: {
    closeTicket: function(ticket) {
      ticket.set('open', false).save();
    }
  },
  openTickets: function() {
    return this.get('model').filter(function(ticket) {
      return ticket.get('open');
    });
  }.property('model.@each.open')
});

// Models
App.Ticket = DS.Model.extend({
  student: DS.attr('string'),
  open: DS.attr('boolean')
});

App.ApplicationAdapter = DS.FirebaseAdapter.extend({
  firebase: new Firebase('https://ember-queue.firebaseio.com')
});
