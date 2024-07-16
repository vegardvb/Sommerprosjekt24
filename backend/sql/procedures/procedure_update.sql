-- Disp for procedure
CREATE OR REPLACE PROCEDURE
    update_transactions_and_refresh_view(user_id INT,
                                         product_id INT,
                                         quantity INT,
                                         transaction_time TIMESTAMP)
    LANGUAGE plpgsql
AS
$$
BEGIN
    BEGIN
        INSERT INTO ledningsmaaling_innmaaling (user_id, product_id, quantity, transaction_time)
        VALUES (:user_id, product_id, quantity, transaction_time);

        REFRESH MATERIALIZED VIEW CONCURRENTLY sales_summary;

        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END;
END;
$$;
