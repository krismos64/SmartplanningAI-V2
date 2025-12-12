'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  loginSchema,
  registerSchema,
  type RegisterFormData,
  createEmployeeSchema,
  type CreateEmployeeFormData,
  type EmploymentType,
  employmentTypeLabels,
  contractTypeLabels,
} from '@/lib/validations'
import {
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormRadioGroup,
  FormDatePicker,
} from '@/components/forms'
import { Mail, Lock, User, Briefcase, Phone } from 'lucide-react'

/**
 * Page de test des composants Form System
 * Accessible uniquement en développement (NODE_ENV === 'development')
 */

export default function TestFormsPage() {
  // Guard : dev only
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            404 - Page non trouvée
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Cette page n&apos;existe pas en production.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            🧪 Form System - Tests
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Page de test des composants de formulaire (dev only)
          </p>
          <p className="mt-1 text-sm font-medium text-amber-600 dark:text-amber-400">
            ⚠️ Cette page est uniquement visible en développement
          </p>
        </div>

        {/* Login Form */}
        <LoginFormTest />

        {/* Register Form */}
        <RegisterFormTest />

        {/* Employee Form */}
        <EmployeeFormTest />

        {/* Component Showcase */}
        <ComponentShowcase />
      </div>
    </div>
  )
}

// ============================================
// LOGIN FORM TEST
// ============================================
function LoginFormTest() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur' as const,
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: {
    email: string
    password: string
    rememberMe?: boolean
  }) => {
    // eslint-disable-next-line no-console
    console.log('✅ Login Form Valid:', data)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    alert(`Login réussi !\nEmail: ${data.email}`)
  }

  return (
    <section className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        1️⃣ Login Form
      </h2>

      <form
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        className="max-w-md space-y-6"
      >
        <FormInput
          label="Email"
          type="email"
          placeholder="exemple@email.com"
          required
          error={errors.email?.message}
          leftIcon={<Mail className="h-4 w-4" />}
          {...register('email')}
        />

        <FormInput
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          required
          error={errors.password?.message}
          leftIcon={<Lock className="h-4 w-4" />}
          {...register('password')}
        />

        <FormCheckbox label="Se souvenir de moi" {...register('rememberMe')} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </section>
  )
}

// ============================================
// REGISTER FORM TEST
// ============================================
function RegisterFormTest() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: RegisterFormData) => {
    // eslint-disable-next-line no-console
    console.log('✅ Register Form Valid:', data)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    alert(`Inscription réussie !\nBienvenue ${data.firstName} ${data.lastName}`)
  }

  return (
    <section className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        2️⃣ Register Form
      </h2>

      <form
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        className="max-w-2xl space-y-6"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormInput
            label="Prénom"
            placeholder="Jean"
            required
            error={errors.firstName?.message}
            leftIcon={<User className="h-4 w-4" />}
            {...register('firstName')}
          />

          <FormInput
            label="Nom"
            placeholder="Dupont"
            required
            error={errors.lastName?.message}
            leftIcon={<User className="h-4 w-4" />}
            {...register('lastName')}
          />
        </div>

        <FormInput
          label="Email"
          type="email"
          placeholder="jean.dupont@email.com"
          required
          error={errors.email?.message}
          leftIcon={<Mail className="h-4 w-4" />}
          {...register('email')}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormInput
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            required
            error={errors.password?.message}
            helpText="Min. 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial"
            leftIcon={<Lock className="h-4 w-4" />}
            {...register('password')}
          />

          <FormInput
            label="Confirmer le mot de passe"
            type="password"
            placeholder="••••••••"
            required
            error={errors.confirmPassword?.message}
            leftIcon={<Lock className="h-4 w-4" />}
            {...register('confirmPassword')}
          />
        </div>

        <FormCheckbox
          label="J'accepte les conditions générales d'utilisation"
          error={errors.acceptTerms?.message}
          {...register('acceptTerms')}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Inscription...' : "S'inscrire"}
        </button>
      </form>
    </section>
  )
}

// ============================================
// EMPLOYEE FORM TEST
// ============================================
function EmployeeFormTest() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateEmployeeFormData>({
    resolver: zodResolver(createEmployeeSchema),
    mode: 'onBlur',
    defaultValues: {
      workingHours: 35,
    },
  })

  const startDate = watch('startDate')
  const endDate = watch('endDate')
  const employmentType = watch('employmentType')

  const onSubmit = async (data: CreateEmployeeFormData) => {
    // eslint-disable-next-line no-console
    console.log('✅ Employee Form Valid:', data)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    alert(
      `Employé créé !\n${data.firstName} ${data.lastName} - ${data.position}`
    )
  }

  return (
    <section className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        3️⃣ Create Employee Form
      </h2>

      <form
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        className="max-w-4xl space-y-6"
      >
        {/* Infos personnelles */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormInput
            label="Prénom"
            required
            error={errors.firstName?.message}
            leftIcon={<User className="h-4 w-4" />}
            {...register('firstName')}
          />

          <FormInput
            label="Nom"
            required
            error={errors.lastName?.message}
            leftIcon={<User className="h-4 w-4" />}
            {...register('lastName')}
          />

          <FormInput
            label="Email"
            type="email"
            required
            error={errors.email?.message}
            leftIcon={<Mail className="h-4 w-4" />}
            {...register('email')}
          />

          <FormInput
            label="Téléphone"
            type="tel"
            placeholder="0612345678"
            error={errors.phone?.message}
            leftIcon={<Phone className="h-4 w-4" />}
            helpText="Format: 0612345678 ou +33612345678"
            {...register('phone')}
          />
        </div>

        {/* Affectation */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormSelect
            label="Département"
            required
            placeholder="Sélectionner un département"
            options={[
              { value: '1', label: 'Ressources Humaines' },
              { value: '2', label: 'Informatique' },
              { value: '3', label: 'Commercial' },
              { value: '4', label: 'Production' },
            ]}
            error={errors.departmentId?.message}
            {...register('departmentId')}
          />

          <FormInput
            label="Poste"
            required
            error={errors.position?.message}
            leftIcon={<Briefcase className="h-4 w-4" />}
            placeholder="Ex: Développeur Full-Stack"
            {...register('position')}
          />
        </div>

        {/* Type emploi + contrat */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormRadioGroup
            name="employmentType"
            label="Type d'emploi"
            required
            options={Object.entries(employmentTypeLabels).map(
              ([value, label]) => ({
                value,
                label,
              })
            )}
            error={errors.employmentType?.message}
            value={employmentType}
            onChange={(value) =>
              setValue('employmentType', value as EmploymentType)
            }
          />

          <FormSelect
            label="Type de contrat"
            required
            placeholder="Sélectionner un type de contrat"
            options={Object.entries(contractTypeLabels).map(
              ([value, label]) => ({
                value,
                label,
              })
            )}
            error={errors.contractType?.message}
            {...register('contractType')}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormDatePicker
            label="Date de début"
            required
            value={startDate ? new Date(startDate) : undefined}
            onChange={(date) =>
              setValue('startDate', date?.toISOString() || '')
            }
            error={errors.startDate?.message}
          />

          <FormDatePicker
            label="Date de fin (optionnelle)"
            value={endDate ? new Date(endDate) : undefined}
            onChange={(date) => setValue('endDate', date?.toISOString() || '')}
            minDate={startDate ? new Date(startDate) : undefined}
            error={errors.endDate?.message}
            helpText="Obligatoire pour CDD, Intérim, Apprentissage"
          />
        </div>

        {/* Salaire + heures */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormInput
            label="Salaire mensuel brut (optionnel)"
            type="number"
            placeholder="2500"
            error={errors.salary?.message}
            {...register('salary', { valueAsNumber: true })}
          />

          <FormInput
            label="Heures de travail / semaine"
            type="number"
            required
            min={1}
            max={168}
            error={errors.workingHours?.message}
            {...register('workingHours', { valueAsNumber: true })}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Création...' : "Créer l'employé"}
        </button>
      </form>
    </section>
  )
}

// ============================================
// COMPONENT SHOWCASE
// ============================================
function ComponentShowcase() {
  return (
    <section className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        4️⃣ Component Showcase
      </h2>

      <div className="max-w-2xl space-y-8">
        {/* FormInput states */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            FormInput States
          </h3>
          <div className="space-y-4">
            <FormInput label="Default" placeholder="Default state" />
            <FormInput
              label="With Error"
              placeholder="Error state"
              error="Ceci est un message d'erreur"
              variant="error"
            />
            <FormInput
              label="Success"
              placeholder="Success state"
              variant="success"
            />
            <FormInput label="Disabled" placeholder="Disabled state" disabled />
          </div>
        </div>

        {/* FormTextarea */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            FormTextarea with Character Count
          </h3>
          <FormTextarea
            label="Description"
            placeholder="Décrivez votre expérience..."
            maxLength={500}
            showCharCount
            helpText="Maximum 500 caractères"
          />
        </div>

        {/* FormCheckbox */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            FormCheckbox
          </h3>
          <div className="space-y-3">
            <FormCheckbox label="Option par défaut" />
            <FormCheckbox label="Option cochée" defaultChecked />
            <FormCheckbox
              label="Option avec erreur"
              error="Veuillez cocher cette case"
            />
            <FormCheckbox label="Option désactivée" disabled />
          </div>
        </div>
      </div>
    </section>
  )
}
