-- Disp for procedure
CREATE OR REPLACE PROCEDURE update_entity_dynamic(json_data JSONB)
    LANGUAGE plpgsql
AS
$$
DECLARE
    key NUMBER;
    value TEXT;
    update TEXT := 'UPDATE entities SET ';
    where_clause TEXT := ' WHERE id = ';
    is_first BOOLEAN := TRUE;
BEGIN
    BEGIN

        FOR key, value IN SELECT * FROM jsonb_each_text(json_data)
        LOOP
            IF key = 'id' THEN
                where_clause := where_clause || quote_literal(value);
            ELSE
                IF NOT is_first THEN
                    update := update || ', ';
                END IF;
                update := update || format('%I = %L', key, value);
                is_first := FALSE;
            END IF;
        END LOOP;

        update := update || where_clause || ';';
        EXECUTE update;

            REFRESH MATERIALIZED VIEW CONCURRENTLY Point;

        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END;
END;
$$;


