// SHOULD PASS: typed catch that does something.
class Negative
{
    void M()
    {
        try { Risky(); }
        catch (System.Exception ex) { System.Console.Error.WriteLine(ex); }
    }
    void Risky() { }
}
