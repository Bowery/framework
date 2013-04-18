module.exports = {
  '/': {
    'get': 'auth!users.index'
  },
  '/login': {
    'get': 'auth.login',
    'post': 'auth.connect'
  },
  '/logout': {
    'get': 'auth.logout'
  },
  '/users':{
    'get': 'users.index',
    'post': 'users.create'
  },
  '/users/new':{
    'get': 'users.new'
  },
  '/users/:id':{
    'get': 'users.show',
    'post': 'users.update',
    'del': 'users.delete'
  },
  '/users/:id/edit':{
    'get': 'users.edit'
  },
  '/test': {
    'get': 'users.cacheTest'
  }
}
