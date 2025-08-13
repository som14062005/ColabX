// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Log {
    struct Commit {
        string sha;
        string message;
        uint256 date; // timestamp from GitHub commit
    }

    struct Project {
        string owner;
        string repo;
        string name;
        address wallet;
        Commit[] commits;
    }

    mapping(uint256 => Project) public projects;
    mapping(address => uint256[]) public userProjects;
    uint256 public projectCount;

    event ProjectAdded(uint256 projectId, address wallet, string owner, string repo);
    event CommitAdded(uint256 projectId, string sha, string message, uint256 date);

    function addProject(
        address wallet,
        string memory owner,
        string memory repo,
        string memory name,
        string[] memory shas,
        string[] memory messages,
        uint256[] memory dates
    ) public {
        require(wallet == msg.sender, "Not your wallet");
        require(shas.length == messages.length && shas.length == dates.length, "Length mismatch");

        uint256 id = ++projectCount;
        Project storage p = projects[id];
        p.owner = owner;
        p.repo = repo;
        p.name = name;
        p.wallet = wallet;

        for (uint256 i = 0; i < shas.length; i++) {
            p.commits.push(Commit(shas[i], messages[i], dates[i]));
            emit CommitAdded(id, shas[i], messages[i], dates[i]);
        }

        userProjects[wallet].push(id);
        emit ProjectAdded(id, wallet, owner, repo);
    }

    function getUserProjectIds(address wallet) public view returns (uint256[] memory) {
        return userProjects[wallet];
    }

    function getProject(uint256 id)
        public
        view
        returns (
            string memory owner,
            string memory repo,
            string memory name,
            address wallet,
            Commit[] memory commits
        )
    {
        Project storage p = projects[id];
        return (p.owner, p.repo, p.name, p.wallet, p.commits);
    }
}