package org.lpu.dev.codes.repository;



import java.util.List;

import org.lpu.dev.codes.model.data.Users;
import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Repository
public class UserRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public void save(Users user) {
        entityManager.persist(user);
        entityManager.flush();
       
    }

    public Users findByUsername(String username) {

        String hql = """
                FROM Users u
                WHERE u.username = :username
                """;

        List<Users> users = entityManager
                .createQuery(hql, Users.class)
                .setParameter("username", username)
                .getResultList();

        return users.isEmpty() ? null : users.get(0);
    }
    
    public List<Users> getAllUsers() {

        String hql = """
                FROM Users u
                ORDER BY u.fullname
                """;

        return entityManager
                .createQuery(hql, Users.class)
                .getResultList();
    }

    public List<Users> getUsersByRole(String role) {

        String hql = """
                FROM Users u
                WHERE u.role = :role
                ORDER BY u.fullname
                """;

        return entityManager
                .createQuery(hql, Users.class)
                .setParameter("role", role)
                .getResultList();
    }
    
    public boolean deleteUserByEmpId(String empId) {
        String hql = """
            DELETE FROM Users u
            WHERE u.employeeId = :empId
            """;

        int rowsAffected = entityManager.createQuery(hql)
                .setParameter("empId", empId)
                .executeUpdate();

        return rowsAffected > 0;
    }
}
