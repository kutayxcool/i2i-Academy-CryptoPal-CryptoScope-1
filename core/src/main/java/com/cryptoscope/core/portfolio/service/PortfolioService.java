package com.cryptoscope.core.portfolio.service;

import com.cryptoscope.core.auth.security.CurrentUserProvider;
import com.cryptoscope.core.common.exception.UserNotFoundException;
import com.cryptoscope.core.portfolio.dto.HoldingResponse;
import com.cryptoscope.core.portfolio.dto.PortfolioResponse;
import com.cryptoscope.core.portfolio.repository.HoldingRepository;
import com.cryptoscope.core.user.entity.User;
import com.cryptoscope.core.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;


/*tokenden authenticated kullanıcı ID alınır.
*   kullanıcının bakiyesi PostgreSQL den okunur.
* kullanıcının kripto varlıkları holdingsten getirilir.
* entitiy değil dto döndürülür.
 */
@Service
public class PortfolioService {

    private final UserRepository userRepository;
    private final HoldingRepository holdingRepository;
    private final CurrentUserProvider currentUserProvider;

    public PortfolioService(
            UserRepository userRepository,
            HoldingRepository holdingRepository,
            CurrentUserProvider currentUserProvider
    ) {
        this.userRepository = userRepository;
        this.holdingRepository = holdingRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional(readOnly = true)
    public PortfolioResponse getCurrentPortfolio() {
        UUID userId = currentUserProvider.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        List<HoldingResponse> holdings = holdingRepository
                .findAllByUserIdOrderBySymbolAsc(userId)
                .stream()
                .map(holding -> new HoldingResponse(
                        holding.getSymbol(),
                        holding.getAmount()
                ))
                .toList();

        return new PortfolioResponse(
                user.getBalance(),
                holdings
        );
    }
}