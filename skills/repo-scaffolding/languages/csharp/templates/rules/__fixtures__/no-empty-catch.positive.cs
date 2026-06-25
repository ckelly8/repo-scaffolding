// SHOULD FLAG: empty catch swallows everything.
class Positive
{
    void M()
    {
        try { Risky(); }
        catch { }
    }
    void Risky() { }
}
