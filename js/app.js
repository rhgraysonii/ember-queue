App = Ember.Application.create();

App.Router.map(function() {
  this.route('help', { path: '/' });
  this.route('ticket', { path: '/ticket/:ticket_id' });
  this.route('queue');
  this.route('statistics');
});

// Routes
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

// Controllers
App.HelpController = Ember.ObjectController.extend({
  actions: {
    createTicket: function() {
      var controller = this;
      model = this.get('model');
      if (model.get('student') && model.get('question')) {
        model.set('open', true);
        model.set('createdAt', new Date());
        model.save()
        .then(function() {
          controller.transitionToRoute('ticket', model);
        });
      } else {
        alert('Please enter your names and questions');
      }
    },

    nextQuestion: function() {
      var questions = this.get('questions')
      var next = questions.shift();
      this.set('currentQuestion', next)
    }
  },

  questions: [
    "Have you gone through all the steps on the Learn How to Program debugging lesson?",
    "Have you asked another pair for help?",
    "Have you spent 15 minutes going through through the problem documenting every step?"
  ],

  currentQuestion: function() {
    return this.get('questions').shift();
  }.property()
});

App.QueueController = Ember.ArrayController.extend({
  itemController: 'ticket',
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

App.TicketController = Ember.ObjectController.extend({
  needs: ['application'],
  isExpanded: false,
  timeAgo: function() {
    return moment(this.get('createdAt')).fromNow();
  }.property('controllers.application.now'),
  actions: {
    closeTicket: function() {
      this.get('model').setProperties({'closedAt': new Date(), 'open': false}).save();
    },
    expand: function() {
      this.set('isExpanded', true);
    },
    collapse: function() {
      this.set('isExpanded', false);
    },
    toggleExpanded: function() {
      var currentState = this.get('isExpanded');
      this.set('isExpanded', !currentState);
    }
  }
});

App.StatisticsController = Ember.ArrayController.extend({
  todaysClosedTickets: function() {
    var this_day = moment().date();
    var this_month = moment().month();
    var this_year = moment().year();
    return this.get('model').filter(function(ticket) {
      var createdAt = moment(ticket.get('createdAt'));
      return createdAt.date() === this_day && createdAt.month() === this_month && createdAt.year() === this_year && !ticket.get('open');
    });
  }.property('model.@each.open'),

  numberOfTickets: function() {
    return this.get('todaysClosedTickets').length
  }.property('model.@each.open'),

  averageWaitTime: function() {
    var waitTimes = this.get('todaysClosedTickets').map(function(ticket) {
      var createdAt = moment(ticket.get('createdAt'));
      var closedAt = moment(ticket.get('closedAt'));
      return closedAt.diff(createdAt, 'seconds');
    });

    var averageTime = waitTimes.reduce(function(sum, next) {
      return sum + next;
    }) / waitTimes.length

    return Math.round(averageTime);
  }.property('model.@each.open'),

  graphData: function() {
    var graphData = []
    var todaysTickets = this.get('todaysClosedTickets');

    todaysTickets.forEach(function(ticket) {
      var formattedHour = moment(ticket.get('createdAt')).format("ha");

      dataPointExisits = graphData.some(function(dataPoint) {
        return dataPoint.hour === formattedHour;
      });

      if (dataPointExisits) {
        graphData.forEach(function(dataPoint) {

          if (dataPoint.hour === formattedHour) {

            dataPoint.tickets += 1
          }
        });
      } else {
        graphData.push({ hour: formattedHour, tickets: 1 });
      }
    });

    return graphData
  // needs to return something like this [{hour: '8am', tickets: 5}, {hour: '9am', tickets: 7}]
}.property('model.@each.open')
});

//Views
App.TicketView = Ember.View.extend({
  scrolling: false,
  touchEnd: function(event) {
    if (!this.get('scrolling')) {
      this.get('controller').send('toggleExpanded');
    }
    this.set('scrolling', false);
  },
  touchMove: function(event) {
    this.set('scrolling', true);
  },
  click: function() {
    this.get('controller').send('toggleExpanded');
  }
})

// Components
App.HourlyTicketsChartComponent = Ember.Component.extend(
{
  graph: null,
  tagName: 'div',
  classNames: ['hourly-tickets-graph'],

  didInsertElement: function() {
    var element = this.get('element').id;
    var self = this;

    this.graph = new Morris.Line({
      element: element,
      data: this.get('data'),
      xkey: 'hour',
      ykeys: ['tickets'],
      labels: ['Tickets'],
      parseTime: false,
      lineColors: ['#f05a26']
    });
  }
});

// Models
App.Ticket = DS.Model.extend({
  student: DS.attr('string'),
  open: DS.attr('boolean'),
  createdAt: DS.attr('date'),
  closedAt: DS.attr('date'),
  question: DS.attr('string')
});

App.ApplicationAdapter = DS.FirebaseAdapter.extend({
  firebase: new Firebase('https://ember-queue.firebaseio.com')
});
