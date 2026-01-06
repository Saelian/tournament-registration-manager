import User from '#models/user'
import OtpToken from '#models/otp_token'
import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'
import app from '@adonisjs/core/services/app'

export default class OtpService {
  /**
   * Generate a 6-digit OTP code
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  /**
   * Request an OTP for a given email.
   * Creates the user if they don't exist.
   * Generates and stores the token.
   * Sends the code via email.
   */
  async sendOtp(email: string): Promise<string> {
    // 1. Find or create user
    // We use findBy because we want to reuse existing user if present
    let user = await User.findBy('email', email)
    if (!user) {
      user = await User.create({ email })
    }

    // 2. Generate code
    const code = this.generateCode()

    // 3. Store token
    // Expires in 10 minutes
    const expiresAt = DateTime.now().plus({ minutes: 10 })

    await OtpToken.create({
      userId: user.id,
      code,
      expiresAt,
    })

    // 4. Send email
    await mail.send((message) => {
      message
        .to(email)
        .subject('Votre code de connexion').html(`
          <h1>Code de connexion</h1>
          <p>Bonjour,</p>
          <p>Voici votre code de connexion pour accéder à l'application de tournoi :</p>
          <h2 style="font-size: 24px; letter-spacing: 5px; background: #f0f0f0; padding: 10px; display: inline-block;">${code}</h2>
          <p>Ce code est valable 10 minutes.</p>
          <p>Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.</p>
        `)
    })

    if (!app.inProduction) {
      console.log(`[OTP] Sent code ${code} to ${email}`)
    }

    return code
  }

  /**
   * Verify the OTP code for a given email.
   * If valid, consumes the token and returns the User.
   * Throws error if invalid or expired.
   */
  async verifyOtp(email: string, code: string): Promise<User> {
    const user = await User.findBy('email', email)
    if (!user) {
      throw new Error('Invalid email or code')
    }

    // Find the token
    const token = await OtpToken.query()
      .where('user_id', user.id)
      .where('code', code)
      .where('expires_at', '>', DateTime.now().toSQL())
      .first()

    if (!token) {
      throw new Error('Invalid or expired code')
    }

    // Consume the token (delete it so it can't be reused)
    await token.delete()

    return user
  }
}
