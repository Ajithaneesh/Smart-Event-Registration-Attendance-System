export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          student_id: string | null
          department: string | null
          year: string | null
          role: 'student' | 'participant' | 'admin' | 'faculty' | 'mentor'
          status: 'pending' | 'approved' | 'rejected'
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          student_id?: string | null
          department?: string | null
          year?: string | null
          role?: 'student' | 'participant' | 'admin' | 'faculty' | 'mentor'
          status?: 'pending' | 'approved' | 'rejected'
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string
          email?: string
          student_id?: string | null
          department?: string | null
          year?: string | null
          role?: 'student' | 'participant' | 'admin' | 'faculty' | 'mentor'
          status?: 'pending' | 'approved' | 'rejected'
          avatar_url?: string | null
          phone?: string | null
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          category: 'Tech' | 'Cultural' | 'Sports' | 'Workshop' | 'Seminar' | null
          date: string
          time: string
          end_time: string | null
          venue: string
          image_url: string | null
          icon: string | null
          featured: boolean
          capacity: number
          created_by: string | null
          registration_open: boolean
          is_paid: boolean
          price: number
          upi_id: string | null
          participation_type: 'Solo' | 'Team'
          max_team_size: number
          registration_deadline: string | null
          status: 'draft' | 'published' | 'cancelled' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category?: 'Tech' | 'Cultural' | 'Sports' | 'Workshop' | 'Seminar' | null
          date: string
          time: string
          end_time?: string | null
          venue: string
          image_url?: string | null
          icon?: string | null
          featured?: boolean
          capacity?: number
          created_by?: string | null
          registration_open?: boolean
          is_paid?: boolean
          price?: number
          upi_id?: string | null
          participation_type?: 'Solo' | 'Team'
          max_team_size?: number
          registration_deadline?: string | null
          status?: 'draft' | 'published' | 'cancelled' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Database['public']['Tables']['events']['Row'], 'id'>>
      }
      event_faculty: {
        Row: {
          id: string
          event_id: string
          faculty_name: string
          faculty_role: string | null
          department: string | null
          email: string | null
          phone: string | null
          is_available: boolean
        }
        Insert: Partial<Database['public']['Tables']['event_faculty']['Row']>
        Update: Partial<Database['public']['Tables']['event_faculty']['Row']>
      }
      registrations: {
        Row: {
          id: string
          user_id: string
          event_id: string
          ticket_id: string
          attended: boolean
          checked_in_at: string | null
          registered_at: string
          payment_status: 'free' | 'pending' | 'paid' | 'failed'
          payment_id: string | null
          team_name: string | null
          team_members: Json
        }
        Insert: Omit<Database['public']['Tables']['registrations']['Row'], 'id' | 'registered_at' | 'attended' | 'checked_in_at'>
        Update: Partial<Database['public']['Tables']['registrations']['Row']>
      }
      form_fields: {
        Row: {
          id: string
          event_id: string
          field_name: string
          field_type: 'text' | 'number' | 'email' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'file'
          is_required: boolean
          options: Json | null
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['form_fields']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['form_fields']['Row']>
      }
      registration_responses: {
        Row: {
          id: string
          registration_id: string
          field_id: string
          response_value: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['registration_responses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['registration_responses']['Row']>
      }
      announcements: {
        Row: {
          id: string
          event_id: string
          title: string
          content: string
          priority: 'low' | 'normal' | 'high' | 'urgent'
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['announcements']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['announcements']['Row']>
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          event_id: string
          certificate_url: string
          issued_at: string
        }
        Insert: Omit<Database['public']['Tables']['certificates']['Row'], 'id' | 'issued_at'>
        Update: Partial<Database['public']['Tables']['certificates']['Row']>
      }
    }
  }
}
