-- Check posts, payments, and unlock requests in one query
WITH approved_posts AS (
    SELECT 
        'post' as type,
        id::text as id,
        post_type,
        status,
        work,
        created_at,
        CASE 
            WHEN post_type = 'employee' THEN employee_photo 
            ELSE photo_url 
        END as display_photo,
        NULL as amount,
        NULL as payment_status
    FROM posts 
    WHERE status = 'approved'
    
    UNION ALL
    
    SELECT 
        'payment' as type,
        p.id::text,
        po.post_type,
        po.status,
        po.work,
        p.created_at,
        CASE 
            WHEN po.post_type = 'employee' THEN po.employee_photo 
            ELSE po.photo_url 
        END as display_photo,
        p.amount,
        p.status as payment_status
    FROM payments p
    JOIN posts po ON p.post_id = po.id
    WHERE p.status = 'pending'
    
    UNION ALL
    
    SELECT 
        'unlock_request' as type,
        ur.id::text,
        po.post_type,
        ur.status,
        po.work,
        ur.created_at,
        CASE 
            WHEN po.post_type = 'employee' THEN po.employee_photo 
            ELSE po.photo_url 
        END as display_photo,
        ur.amount,
        ur.status as payment_status
    FROM contact_unlock_requests ur
    JOIN posts po ON ur.post_id = po.id
    WHERE ur.status = 'pending'
)

-- Main query with additional checks
SELECT 
    type,
    id,
    post_type,
    status,
    work,
    amount,
    payment_status,
    display_photo IS NOT NULL as has_photo,
    created_at
FROM approved_posts
ORDER BY 
    CASE 
        WHEN type = 'post' THEN 1
        WHEN type = 'payment' THEN 2
        WHEN type = 'unlock_request' THEN 3
        ELSE 4
    END,
    created_at DESC
LIMIT 50;