App = Ember.Application.create();

App.Router.map(function() {
  this.route('help');
});

// Routes
App.HelpRoute = Ember.Route.extend({
  model: function() {
    return this.store.createRecord('ticket')
  }
});

// Controllers
App.HelpController = Ember.ObjectController.extend({
  actions: {
    createTicket: function() {
      this.get('model').set('open', true).save();
    }
  }
})

// Models
App.Ticket = DS.Model.extend({
  student: DS.attr('string'),
  open: DS.attr('boolean')
});

App.ApplicationAdapter = DS.FirebaseAdapter.extend({
  firebase: new Firebase('https://ember-queue.firebaseio.com')
});
