-- Supabase Database Cleanup Script
-- Safely removes all junk tables in the 'public' schema that are NOT part of the choutuppal-app-v2.0 Prisma schema.
-- Preserves auth.* tables (by only targeting the 'public' schema) and the '_prisma_migrations' table.

DO $$
DECLARE
    r RECORD;
    -- Whitelist of required tables exactly as defined in prisma/schema.prisma
    whitelist TEXT[] := ARRAY[
        'User', 
        'Account', 
        'Session', 
        'VerificationToken', 
        'PasswordResetToken',
        'Category', 
        'Village', 
        'Listing', 
        'RealEstate', 
        'Story', 
        'StoryView',
        'StoryReply', 
        'StoryLike', 
        'Banner', 
        'Service', 
        'Short', 
        'News', 
        'Blog',
        'Notification', 
        'CommunityPost', 
        'CommunityLike', 
        'CommunityComment',
        'Lead', 
        'Setting', 
        'SpinPrize', 
        'CityInquiry', 
        'Review', 
        'AutoLink',
        'Tenant', 
        'WhatsAppSetting', 
        'WhatsAppContact', 
        'ContactGroup',
        'WhatsAppTemplate', 
        'TriggerRule', 
        'WhatsAppLog', 
        'SystemPrompt',
        'WhatsAppCampaign', 
        '_ContactGroupToWhatsAppContact', -- Implicit many-to-many join table for ContactGroup <-> WhatsAppContact
        '_prisma_migrations'
    ];
BEGIN
    -- Loop through all tables in the 'public' schema that are NOT in the whitelist
    FOR r IN
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename != ALL(whitelist)
    LOOP
        -- Execute the drop command safely with CASCADE to remove dependent objects
        EXECUTE 'DROP TABLE IF EXISTS public."' || r.tablename || '" CASCADE;';
        RAISE NOTICE 'Dropped junk table: %', r.tablename;
    END LOOP;
END
$$;
