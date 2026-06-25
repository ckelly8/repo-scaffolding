using System.Collections.Generic;
using NetArchTest.Rules;
using Xunit;

namespace Scope.ArchitectureTests;

// The C# analogue of dependency-cruiser rules. Each test encodes one row of the CLAUDE.md
// dependency-chain table as a forbidden edge. NetArchTest reflects over the referenced
// assemblies, so a violation fails `dotnet test` — which is the pre-push gate.
public class BoundaryTests
{
    // no-app-imports: foundation libraries must never depend on a leaf app.
    // Apps are composition roots; an inward edge from the core into an app is a layering violation.
    [Fact]
    public void Core_does_not_depend_on_App()
    {
        var result = Types.InAssembly(typeof(Scope.Core.AssemblyMarker).Assembly)
            .That().ResideInNamespaceStartingWith("Scope.Core")
            .ShouldNot().HaveDependencyOn("Scope.App")
            .GetResult();

        Assert.True(
            result.IsSuccessful,
            "Scope.Core must not depend on Scope.App. Offenders: "
                + string.Join(", ", result.FailingTypeNames ?? new List<string>()));
    }

    // Template for any other forbidden edge from the dependency table — copy, rename, and
    // swap the namespaces. Delete if the target has only the one rule above.
    // [Fact]
    // public void Foundation_does_not_depend_on_Infrastructure() { ... }
}
