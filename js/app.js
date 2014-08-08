App = Ember.Application.create();

App.Router.map(function() {
  this.route('help', { path: '/' });
  this.route('queued');
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
      var controller = this;
      model = this.get('model');
      model.set('open', true);
      model.set('createdAt', new Date());
      model.save()
      .then(function() {
        controller.transitionToRoute('queued');
      });
    }
  }
});

App.QueueController = Ember.ArrayController.extend({
  actions: {
    closeTicket: function(ticket) {
      ticket.set('open', false).save();
    }
  },
  tickets: function() {
    var openTickets = this.get('model').filter(function(ticket) {
      return ticket.get('open');
    })

    var orderedTickets = openTickets.sort(function(a, b) {
      if (a.get('createdAt') > b.get('createdAt')) {
        return 1;
      } else {
        return -1;
      }
    });

    return orderedTickets;
  }.property('model.@each.open')
});

// Models
App.Ticket = DS.Model.extend({
  student: DS.attr('string'),
  open: DS.attr('boolean'),
  createdAt: DS.attr('date')
});

App.ApplicationAdapter = DS.FirebaseAdapter.extend({
  firebase: new Firebase('https://ember-queue.firebaseio.com')
});
