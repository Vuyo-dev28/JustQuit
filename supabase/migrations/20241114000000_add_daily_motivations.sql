
CREATE TABLE daily_motivations (
    id bigserial PRIMARY KEY,
    quote text NOT NULL,
    author text
);

INSERT INTO daily_motivations (quote, author) VALUES
('The secret of getting ahead is getting started.', 'Mark Twain'),
('It does not matter how slowly you go as long as you do not stop.', 'Confucius'),
('Believe you can and you''re halfway there.', 'Theodore Roosevelt'),
('Our greatest glory is not in never falling, but in rising every time we fall.', 'Confucius'),
('The journey of a thousand miles begins with a single step.', 'Lao Tzu'),
('Success is the sum of small efforts, repeated day in and day out.', 'Robert Collier'),
('Strength does not come from physical capacity. It comes from an indomitable will.', 'Mahatma Gandhi'),
('What you get by achieving your goals is not as important as what you become by achieving your goals.', 'Zig Ziglar'),
('The only person you are destined to become is the person you decide to be.', 'Ralph Waldo Emerson'),
('Either you run the day, or the day runs you.', 'Jim Rohn');

CREATE OR REPLACE FUNCTION get_random_motivation()
RETURNS TABLE (id bigint, quote text, author text) AS $$
BEGIN
    RETURN QUERY
    SELECT m.id, m.quote, m.author
    FROM daily_motivations m
    ORDER BY random()
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;
