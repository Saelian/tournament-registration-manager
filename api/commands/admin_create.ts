import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class AdminCreate extends BaseCommand {
  static override commandName = 'admin:create'
  static override description = 'Créer un nouvel administrateur'

  static override options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: "Email de l'administrateur", required: false })
  declare email?: string

  @args.string({ description: "Nom complet de l'administrateur", required: false })
  declare fullName?: string

  @flags.string({ description: "Mot de passe de l'administrateur" })
  declare password?: string

  async run(): Promise<void> {
    // Import dynamique pour éviter les problèmes de chargement
    const { default: Admin } = await import('#models/admin')

    // Mode interactif si les arguments ne sont pas fournis
    const emailInput = this.email ?? (await this.prompt.ask("Email de l'administrateur"))
    const fullNameInput =
      this.fullName ?? (await this.prompt.ask("Nom complet de l'administrateur"))
    const passwordInput =
      this.password ?? (await this.prompt.secure('Mot de passe (min. 8 caractères)'))

    // Vérification des valeurs requises
    if (!emailInput || !fullNameInput || !passwordInput) {
      this.logger.error('Tous les champs sont requis')
      this.exitCode = 1
      return
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailInput)) {
      this.logger.error("Format d'email invalide")
      this.exitCode = 1
      return
    }

    // Validation du mot de passe
    if (passwordInput.length < 8) {
      this.logger.error('Le mot de passe doit contenir au moins 8 caractères')
      this.exitCode = 1
      return
    }

    // Vérification de l'unicité de l'email
    const existingAdmin = await Admin.findBy('email', emailInput)
    if (existingAdmin) {
      this.logger.error(`Un administrateur avec l'email "${emailInput}" existe déjà`)
      this.exitCode = 1
      return
    }

    // Création de l'administrateur
    const admin = await Admin.create({
      email: emailInput,
      fullName: fullNameInput,
      password: passwordInput, // Le modèle Admin gère le hashage via AuthFinder
    })

    this.logger.success('Administrateur créé avec succès :')
    this.logger.info(`  ID    : ${admin.id}`)
    this.logger.info(`  Email : ${admin.email}`)
    this.logger.info(`  Nom   : ${admin.fullName}`)
  }
}
