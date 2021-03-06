
var ajax = require('ajax');
//var modules = require('./dsp-modules');
var campaigns = require('./campaigns');
var emitter = require('emitter');
var utils = require('./utils');
var fund = require('./fund');
var tree = require('treeview');
var createElement = utils.createElement;

var library = {};
/*
[
  'simple-sine',
  'on-the-verge',
  'on-the-verge-tech-mix',
  'polytropon',
  'polytropon-astral-mix',
  'unexpected-token',
  'early-morning',
  'morning',
  'late-morning',
  'icecream',
  'got-some-303',
  'need-more-303',
  'subwah'
]
.forEach(function(name){
  library['/projects/' + name.replace(/-/g, ' ')] = require('./library/projects/' + name)
    .toString()
    .split('\n')
    .slice(1, -1)
    .join('\n');
});
*/
var sidebar = module.exports = emitter({});

sidebar.create = createSidebar;

function createSidebar(context){
  sidebar.el = createElement('sidebar');

  sidebar.on('select', function(node){
    var path = node.path();
    var dir = path.split('/')[1];

    switch (dir) {
      case 'projects':
        var sublime = context.sublime;
        if (!sublime) return;

        if (context.hasEdited) {
          if (!confirm('You\'ve made some edits!\n\nAre you sure you want to load a new project and lose everything?')) return;
        }

        context.isNewProject = true;

        var session = sublime.editor.getSession();

        ajax.get(path, function(code){
          session.setValue(code);
        });

        break;

      default:
        fund.show('milestone I');
        break;
    }
  });

  var nodes = [
    ['modules', true],
    ['projects', true]
  ];

  var contents = {
    '/modules': [
      ['effects', true],
      ['oscillators', true],
      ['sequencers', true],
      ['synths', true],
      ['various', true]
    ],
    //'/projects': Object.keys(library).map(function(name){ return [name.split('/').pop()]; }),
    '/modules/effects': [
      ['amp', true],
      ['chorus', true],
      ['delay', true],
      ['dynamics', true],
      ['eq', true],
      ['filter', true],
      ['flanger', true],
      ['modulation', true],
      ['phaser', true],
      ['reverb', true]
    ],
    '/modules/synths': [
      ['ambient', true],
      ['analog', true],
      ['bass', true],
      ['drums', true],
      ['flute', true],
      ['fm', true],
      ['fx', true],
      ['modular', true],
      ['organ', true],
      ['pads', true],
      ['percussion', true],
      ['piano', true],
      ['sample', true],
      ['strings', true]
    ]
  };

  function fetch(node, fn){
    var path = node.path();
    var parts = path.split('/');
    var dir = parts[1];
    var res = contents[path];
    if (!res) {
      switch (dir) {
        case 'projects':
          load(path, fn);
          break;
        default:
          fund.show('milestone I');
          fund.modal.once('hiding', fn.bind(this, new Error('no results')));
          break;
      }
    } else {
      fn(null, contents[path]);
    }
  }

  function load(path, fn){
    ajax.getJSON(path, function(res){
      res = res.map(function(name){
        return [name];
      });
      fn(null, res);
    });
  }

  setTimeout(function(){
    tree(sidebar, nodes, fetch)[1].click(function(err, nodes){
      var path = document.location.pathname;

      if ('/' == path) {
        nodes.forEach(function(node){
          if (~node.path().indexOf('simple sine')) node.click();
        });
      } else {
        loadRawGit(path);
      }
    });
  }, 0);

  function loadRawGit(path){
    var sublime = context.sublime;
    if (!sublime) return;

    context.isNewProject = true;

    var session = sublime.editor.getSession();

    path = 'https://cdn.rawgit.com' + path;

    if (!~path.indexOf('/raw/')) path += '/raw/';

    ajax({
      url: path,
      dataType: 'text/plain',
      success: success
    });

    function success(code){
      session.setValue(code);
    }
  }
/*
  sidebar.header = createElement('header');
  sidebar.header.innerHTML = '<ul><li>modules<li>projects<li>samples<li>visuals</ul>';

  sidebar.list = document.createElement('ul');
  sidebar.list.className = 'browser';

  var keys = Object.keys(modules);
  keys.unshift('+ create');
  keys.forEach(function(key){
    var item;
    item = document.createElement('li');
    item.innerHTML = key;
    sidebar.list.appendChild(item);
  });

  sidebar.el.appendChild(sidebar.header);
  sidebar.el.appendChild(sidebar.list);
*/
}
