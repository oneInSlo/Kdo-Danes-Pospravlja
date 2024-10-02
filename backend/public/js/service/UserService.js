import Request from './Request.js'
class UserService {
  static async getMyName() {
    const res = await new Request(window.location.origin + '/user/logged')
      .method('GET')
      .send()
    
    return res.ime_priimek
  }
}

export default UserService