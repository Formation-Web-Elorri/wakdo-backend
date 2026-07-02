import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    await User.create({
      fullName: 'admin',
      email: 'admin@wakdo.fr',
      password: '123',
      role: 'administration',
    })
  }
}
